export function Template(scenario: (...args: any[]) => string) {
    return new Proxy(scenario, {
        apply: async function (template, world, args) {
            const scenario = template(...args) as string;
            const steps = scenario
                .split('\n')
                .map(step => step.trim())
                .filter(step => step);
            for (const step of steps) {
                await world.executeStep(step);
            }
        },
    })
}