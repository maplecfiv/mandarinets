// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineException } from "../../exceptions/mandarineException.ts";
import { Mandarine } from "../../Mandarine.ns.ts";
import { MiddlewareTarget } from "./middlewareTarget.ts";
import { MiddlewareUtil } from "../../utils/components/middlewareUtil.ts";

/**
* This class is used in the DI Container for Mandarine to store components annotated as @Middleware
*/
export class MiddlewareComponent implements Mandarine.MandarineCore.ComponentCommonInterface {

    public name?: string;
    public regexRoute?: RegExp;
    public classHandler: any;

    constructor(name?: string, regexRoute?: RegExp, classHandler?: any) {
        this.name = name;
        this.regexRoute = regexRoute;
        this.classHandler = classHandler;
    }

    public verifyHandlerImplementation() {
        let middlewareTarget: MiddlewareTarget = <MiddlewareTarget> this.classHandler;
        MiddlewareUtil.verifyImplementation(middlewareTarget);
    }

    public getName() {
        return this.name;
    }

    public getClassHandler() {
        return this.classHandler;
    }

    public setClassHandler(handler: any) {
        this.classHandler = handler;
    }

    public getRegexRoute() {
        return this.regexRoute;
    }

}