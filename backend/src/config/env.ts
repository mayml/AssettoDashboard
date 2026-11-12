function required(name: string): string {
    const value = Bun.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export const env = {
    appPort: Number(required("APP_PORT")),
    databaseUrl: required("DATABASE_URL"),
    jwtAccessSecret: required("JWT_ACCESS_SECRET"),
};