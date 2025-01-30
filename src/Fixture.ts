import { After, Before } from '@cucumber/cucumber';

export function Fixture(name: string, fn: () => Promise<unknown>) {
    let fixtureTearDown: () => Promise<unknown>;
    Before({ name: `setup @${name}`, tags: `@${name}` }, async function(this) {
        fixtureTearDown = await fn.bind(this)() as () => Promise<unknown>;
    });
    After({ name: `teardown @${name}`, tags: `@${name}` }, async function (this) {
        if (fixtureTearDown) {
            await fixtureTearDown.bind(this)();
        }
    });
}