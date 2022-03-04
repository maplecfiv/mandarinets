// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { MandarineConstants } from "../../main-core/mandarineConstants.ts";

export class AuthUtils {
    public static async findAuthCookie(context: Mandarine.Types.RequestContext): Promise<string | undefined> {
        /** https://deno.land/x/oak@v9.0.0/CHANGELOG.md
         *  https://github.com/oakserver/oak/commit/14c6b47
         *  oak use web crypto for sign coookies since 9.0.0
         */
        return await context.cookies.get(MandarineConstants.SECURITY_AUTH_COOKIE_NAME, { signed: true });
    }

    public static verifyAuthenticationSatisfaction(withSessionContainer?: boolean): boolean {
        const getAuthManagerBuilder = Mandarine.Security.getAuthManagerBuilder();
        return (getAuthManagerBuilder.passwordEncoder != undefined 
                && getAuthManagerBuilder.userDetailsService != undefined
                    && (withSessionContainer === false || Mandarine.Global.getSessionContainer().store != undefined));
    }

    public static verifyHTTPLogingConfigurerSatisfaction(loginConfigurer: Mandarine.Security.Core.LoginConfigurer): boolean {
        return (loginConfigurer.loginProcessingUrl != undefined
                            && loginConfigurer.logoutUrl != undefined
                                && loginConfigurer.passwordParameter != undefined
                                    && loginConfigurer.usernameParameter != undefined);
    }
}