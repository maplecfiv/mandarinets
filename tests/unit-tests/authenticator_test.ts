// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Test, DenoAsserts, Orange, mockDecorator, MockCookies } from "../mod.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { MainCoreDecoratorProxy } from "../../main-core/proxys/mainCoreDecorator.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { Cookies } from "../../deps.ts";
import { KeyStack } from "../../security-core/keyStack.ts";
import { Authenticator } from "../../main-core/mandarine-native/security/authenticatorDefault.ts";
import { handleBuiltinAuth } from "../../mvc-framework/core/middlewares/authMiddleware.ts";
import { MandarineConstants } from "../../main-core/mandarineConstants.ts";
import { sessionTimerHandlers } from "../../main-core/mandarine-native/sessions/mandarineSessionHandlers.ts";

export class AuthenticationTest {


    @Test({
        name: "Test authenticator",
        description: "Should test authenticator, and login, inject principal in request, then logout"
    })
    public async testAuthenticator() {

        let user = {
            roles: ["ANYROLE"],
            password: "$2a$10$q9ndDolU5EM0PFy1Zu2I7Ougcw/oHrkB8/mCBf01Fuae6okON.61O",
            username: "test",
            uid: 1,
            accountExpired: false,
            accountLocked: false,
            credentialsExpired: false,
            enabled: true
        };

        @mockDecorator()
        class AuthManagerService  {

            public users = [Object.assign({}, user)];

            public loadUserByUsername(username: any) {
                return this.users.find((item) => item.username === username)
            }
        }

        ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry();
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(AuthManagerService, Mandarine.MandarineCore.ComponentTypes.SERVICE, {}, null);
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();

        @mockDecorator()
        class FakeOverrideClass extends Mandarine.Native.WebMvcConfigurer{

            public authManagerBuilder(provider: Mandarine.Security.Auth.AuthenticationManagerBuilder) {
                provider = provider.userDetailsService(AuthManagerService);
                return provider;
            }

        }

        Mandarine.Global.initializeNativeComponents();
        MainCoreDecoratorProxy.overrideNativeComponent(FakeOverrideClass, Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer);

        Mandarine.Global.initializeDefaultSessionContainer();
        const sessionContainerStore = Mandarine.Global.getSessionContainer().store;
        if(sessionContainerStore && sessionContainerStore.launch) {
            sessionContainerStore.launch();
        }

        let requestContext: { request: { headers: Headers }, response: { headers: Headers }, cookies: Cookies } = {
            request: {
                headers: new Headers()
            },
            response: {
                headers: new Headers()
            },
            cookies: <any><unknown> undefined
        }

        requestContext.cookies = new Cookies(<any>requestContext.request, <any>requestContext.response, {
            keys: (<any>new KeyStack(["TEST"]))
        });

        const authenticator = new Authenticator();

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].password = "$2y$15$.rp/dnmo94FY9AgHHMLkH.YDdrDw/wUaUyNCdw62tdbMf7pWWrEqy";
        let authenticate = (await authenticator.performHTTPAuthentication({
            username: "test", 
            password: "Changeme1",
            requestContext: <any>requestContext
        }))[0];

        DenoAsserts.assertEquals(authenticate, {
            status: "FAILED",
            message: "MandarineAuthenticationException: Password is invalid",
            exception: Mandarine.Security.Auth.AuthExceptions.INVALID_PASSWORD
        });

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].password = user.password;
        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].accountExpired = true;

        authenticate = (await authenticator.performHTTPAuthentication({
            username: "test", 
            password: "Changeme1",
            requestContext: <any>requestContext
        }))[0];

        DenoAsserts.assertEquals(authenticate, {
            status: "FAILED",
            message: "MandarineAuthenticationException: Account has expired",
            exception: Mandarine.Security.Auth.AuthExceptions.ACCOUNT_EXPIRED
        });

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].accountExpired = false;
        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].accountLocked = true;

        authenticate = (await authenticator.performHTTPAuthentication({
            username: "test", 
            password: "Changeme1",
            requestContext: <any>requestContext
        }))[0];

        DenoAsserts.assertEquals(authenticate, {
            status: "FAILED",
            message: "MandarineAuthenticationException: Account is locked",
            exception: Mandarine.Security.Auth.AuthExceptions.ACCOUNT_LOCKED
        });

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].accountLocked = false;
        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].credentialsExpired = true;

        authenticate = (await authenticator.performHTTPAuthentication({
            username: "test", 
            password: "Changeme1",
            requestContext: <any>requestContext
        }))[0];

        DenoAsserts.assertEquals(authenticate, {
            status: "FAILED",
            message: "MandarineAuthenticationException: Credentials are expired or are not valid",
            exception: Mandarine.Security.Auth.AuthExceptions.CREDENTIALS_EXPIRED
        });

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].credentialsExpired = false;
        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].enabled = false;

        authenticate = (await authenticator.performHTTPAuthentication({
            username: "test", 
            password: "Changeme1",
            requestContext: <any>requestContext
        }))[0];

        DenoAsserts.assertEquals(authenticate, {
            status: "FAILED",
            message: "MandarineAuthenticationException: Account is currently disabled",
            exception: Mandarine.Security.Auth.AuthExceptions.ACCOUNT_DISABLED
        });

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].enabled = true;
        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].roles = undefined;

        authenticate = (await authenticator.performHTTPAuthentication({
            username: "test", 
            password: "Changeme1",
            requestContext: <any>requestContext
        }))[0];

        DenoAsserts.assertEquals(authenticate, {
            status: "FAILED",
            message: "MandarineAuthenticationException: Roles in user are not valid inside Mandarine's context",
            exception: Mandarine.Security.Auth.AuthExceptions.INVALID_ROLES
        });

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].roles = user.roles;
        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].username = undefined;

        authenticate = (await authenticator.performHTTPAuthentication({
            username: "test", 
            password: "Changeme1",
            requestContext: <any>requestContext
        }))[0];

        DenoAsserts.assertEquals(authenticate, {
            status: "FAILED",
            message: "MandarineAuthenticationException: User does not exist",
            exception: Mandarine.Security.Auth.AuthExceptions.INVALID_USER
        });

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].username = user.username;

        authenticate = (await authenticator.performHTTPAuthentication({
            username: "test", 
            password: "Changeme1",
            requestContext: <any>requestContext
        }))[0];

        DenoAsserts.assertEquals(authenticate, {
            status: "PASSED",
            message: "Success",
            authSesId: authenticate.authSesId
        });
        let toSetCookies = requestContext.response.headers.get("set-cookie");
        let processingCookies = toSetCookies?.split(", MDAUTHID");
        if(processingCookies) {
            let unsignedCookie = processingCookies[0].split("; path=/;")[0].split("=")[1];
            let signedCookie = processingCookies[1].split("; path=/;")[0].split("=")[1];

            requestContext.cookies = <any> new MockCookies();

            requestContext.cookies.set(MandarineConstants.SECURITY_AUTH_COOKIE_NAME, unsignedCookie);
            requestContext.cookies.set(MandarineConstants.SECURITY_AUTH_COOKIE_NAME + ".sig", signedCookie);

            let authenticate2 = await authenticator.performHTTPAuthentication({
                username: "test", 
                password: "Changeme1",
                requestContext: <any>requestContext
            });

            DenoAsserts.assertNotEquals(authenticate2[0].authSesId, undefined);

            DenoAsserts.assertEquals(authenticate2[0], {
                status: "ALREADY-LOGGED-IN",
                message: "Success",
                authSesId: authenticate.authSesId
            });

            DenoAsserts.assertNotEquals(authenticate2[1], undefined);
            DenoAsserts.assertEquals(authenticate2[1]?.username, "test");
            
            await handleBuiltinAuth()(<any>requestContext, () => {});

            DenoAsserts.assert((requestContext.request as any).authentication != undefined);
            DenoAsserts.assert((requestContext.request as any).authentication.AUTH_SES_ID != undefined);
            DenoAsserts.assert((requestContext.request as any).authentication.AUTH_EXPIRES != undefined);
            DenoAsserts.assert((requestContext.request as any).authentication.AUTH_PRINCIPAL != undefined);
            DenoAsserts.assertEquals((requestContext.request as any).authentication.AUTH_PRINCIPAL, user);

            authenticator.stopHTTPAuthentication(<any>requestContext);

            DenoAsserts.assertEquals(Mandarine.Global.getSessionContainer().store?.getAll(), []);

            await handleBuiltinAuth()(<any>requestContext, () => {});

            DenoAsserts.assert((requestContext.request as any).authentication === undefined);

            sessionTimerHandlers.stopExpirationHandler();
            Mandarine.Global.getSessionContainer().store = <any><unknown>null;
        }

    }

}