import { ComponentCommonInterface } from "../componentCommonInterface.ts";

export class ConfigurationComponent {
    private name?: string;
    private classHandler: any;

    constructor(name?: string, classHandler?: any) {
        this.name = name;
        this.classHandler= classHandler;
    }

    public getName() {
        return this.name;
    }

    public getClassHandler() {
        return this.classHandler;
    }

}