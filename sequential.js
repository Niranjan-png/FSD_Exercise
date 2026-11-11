async function getUser(id) {

    console.log("Starting user:", id);

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Completed user:", id);

}

async function main() {

    const start = Date.now();

    for (let id = 1; id <= 4; id++) {
        await getUser(id);
    }

    console.log("Total time:", (Date.now() - start) / 1000, "seconds");

}

main();