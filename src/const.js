import config from "./config/theme";

export const constant = {
    //live url
    // backend_url: "https://api-jokkowallet.hashcodexperts.com/jokkoapi",
        backend_url: "http://localhost:3700/jokkoapi",

    adminRoute: config?.project?.name.split(" ")
        .map((word, index) =>
            index === 0
                ? word.toLowerCase()
                : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(""),
}