async function fetchUser(id) {

    return retry(async () => {

        const response = await fetch(
            `https://jsonplaceholder.typicode.com/users/${id}`,
            {
                signal: AbortSignal.timeout(5000)
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();

    }, 2);

}


async function retry(fn, retries) {

    for (let attempt = 0; ; attempt++) {

        try {

            return await fn();

        } catch (error) {

            if (attempt >= retries) {
                throw error;
            }

            const delay = 500 * 2 ** attempt;

            console.log("Retrying:", error.message);

            await new Promise(resolve =>
                setTimeout(resolve, delay)
            );

        }

    }

}


async function mapLimit(items, limit, fn) {

    const results = new Array(items.length);

    let next = 0;

    async function worker() {

        while (true) {

            const index = next++;

            if (index >= items.length) return;

            try {

                results[index] = await fn(items[index]);

            } catch (error) {

                results[index] = {
                    error: error.message
                };

            }

        }

    }

    await Promise.all(
        Array.from(
            { length: Math.min(limit, items.length) },
            () => worker()
        )
    );

    return results;

}


async function main() {

    const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    console.log("Fetching users...");

    const users = await mapLimit(
        ids,
        3,
        fetchUser
    );

    for (const user of users) {

        if (user.error) {
            console.log(user.error);
        } else {
            console.log(user.id, user.name, user.email);
        }

    }

    console.log("All tasks completed!");

}


main().catch(console.error);