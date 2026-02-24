import config from "./config/theme";

export const constant = {
    backend_url: "http://localhost:5000",
    adminRoute: config?.project?.name.split(" ")
        .map((word, index) =>
            index === 0
                ? word.toLowerCase()
                : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(""),
}
