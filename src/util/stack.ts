import * as pulumi from "@pulumi/pulumi";

export const isProduction = () => pulumi.getStack() === "production";
export const isCi = () => pulumi.getStack() === "ci";
