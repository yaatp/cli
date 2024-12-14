export default {
    before() {
        console.log(`service 3 started with ${this.options.data}`);
    }
} as { options: any, before: any, after: any; };