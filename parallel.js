async function getUser(id) {

    console.log("Starting user:", id);

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Completed user:", id);

    return `User ${id}`;

}

async function main() {

    const start = Date.now();

    const users = await Promise.all([
        getUser(1),
        getUser(2),
        getUser(3),
        getUser(4)
    ]);

    console.log(users);

    console.log("Total time:", (Date.now() - start) / 1000, "seconds");

}

main();