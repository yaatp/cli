import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import yarnInstall from 'yarn-install';
import deps, {steps, format, modules, ModuleDefinition} from './deps';

type Answers = {
    steps: Array<string>,
    formats: Array<string>,
    modules: Array<string>,
    parallel: number
}

const packs = (deps: Array<ModuleDefinition>) => deps.map(({module}) => module);
const packages = (moduleList: Array<string>, packageMap: Array<ModuleDefinition>): Array<string> => {
    return moduleList
        .map((module: string) => {
            const pkg = packageMap.find((p: ModuleDefinition) => p.module === module);
            if (!pkg) throw new Error(`${module} module is not found`);
            return pkg.packageName
        }) as Array<string>
}

export default async function install(): Promise<void> {
    const requiredDeps = [...deps];
    const answers = await inquirer.prompt([
        {
            type: 'checkbox',
            message: 'select step packages to install:',
            name: 'steps',
            choices: packs(steps)
        },
        {
            type: 'checkbox',
            message: 'select modules to install:',
            name: 'modules',
            choices: packs(modules)
        },
        {
            type: 'checkbox',
            message: 'select formatters (reporters) to install:',
            name: 'formats',
            choices: packs(format)
        }
    ]) as Answers;

    const stepsPackages: Array<string> = packages(answers.steps, steps);
    const formatPackages: Array<string> = packages(answers.formats, format);
    const modulePackages: Array<string> = packages(answers.modules, modules);

    const isWdioIncluded = answers.steps.includes('wdio');
    const isPlaywrightIncluded = answers.steps.includes('playwright');
    //checking if user selected only one browser driver
    if (isPlaywrightIncluded && isWdioIncluded) {
        throw new Error('Please select only one browser driver');
    }
    const isPOIncluded: boolean = isWdioIncluded || isPlaywrightIncluded;
    const isTemplateIncluded: boolean = answers.modules.includes('template');

    const configTemplate: string = await fs.readFile(
        path.resolve(__dirname, '../templates/config.template'),
        'utf-8'
    );

    let config: string = configTemplate
        .replace('<steps>', JSON.stringify([...stepsPackages].map(p => 'node_modules/' + p)))
        .replace('<format>', JSON.stringify(formatPackages))
        .replace('<modules>', JSON.stringify(modulePackages));

    await fs.ensureDir('./features');
    await fs.ensureDir('./memory');
    await fs.ensureDir('./report');

    if (isPOIncluded) {
        const poModule = isWdioIncluded ? '@qavajs/po' : '@qavajs/po-playwright';
        requiredDeps.push(poModule);
        const featureTemplate: string = await fs.readFile(
            path.resolve(__dirname, '../templates/feature.template'),
            'utf-8'
        );
        await fs.writeFile('./features/qavajs.feature', featureTemplate, 'utf-8');
        const browserName = isWdioIncluded ? 'chrome' : 'chromium';
        const pageObjectSnippet =
    `
        pageObject: new App(),
        browser: {
            capabilities: {
                browserName: "${browserName}"
            }
        },
    `
        config = config
            .replace('<importPageObject>', 'const App = require("./page_object");')
            .replace('<configPageObject>', pageObjectSnippet);

        //create page object folder
        await fs.ensureDir('./page_object');
        const poTemplate: string = await fs.readFile(
            path.resolve(__dirname, '../templates/po.template'),
            'utf-8'
        );
        await fs.writeFile('./page_object/index.js', poTemplate.replace('<poModule>', poModule), 'utf-8');
    }

    if (isTemplateIncluded) {
        await fs.ensureDir('./templates');
        config = config
            .replace('<templates>', 'templates: ["templates/*.feature"],');
    }

    config = config
        .replace(/<.+?>/g, '')
        .replace(/\n\s+\n/g, '\n');

    await fs.writeFile('config.js', config, 'utf-8');

    const memoryTemplate: string = await fs.readFile(
        path.resolve(__dirname, '../templates/memory.template'),
        'utf-8'
    );

    await fs.writeFile('./memory/index.js', memoryTemplate, 'utf-8');

    const modulesToInstall = [...requiredDeps, ...stepsPackages, ...formatPackages, ...modulePackages];
    console.log('installing packages...');
    console.log(modulesToInstall);

    yarnInstall({
        deps: modulesToInstall,
        cwd: process.cwd(),
        respectNpm5: true
    });
}
