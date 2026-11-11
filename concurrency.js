async function mapLimit(items, limit, fn) {

    const results = new Array(items.length);

    let next = 0;

    async function worker() {

        while (true) {

            const index = next++;

            if (index >= items.length) {
                return;
            }

            results[index] = await fn(items[index]);

        }
    }

    const workers = Array.from(
        { length: Math.min(limit, items.length) },
        () => worker()
    );

    await Promise.all(workers);

    return results;
}


// Example function
async function processTask(number) {

    console.log("Started:", number);

    await new Promise(resolve =>
        setTimeout(resolve, 2000)
    );

    console.log("Finished:", number);

    return number * 10;

}


async function main() {

    const numbers = [1, 2, 3, 4, 5, 6, 7];

    const results = await mapLimit(
        numbers,
        3,
        processTask
    );

    console.log("Final results:", results);

}

main();