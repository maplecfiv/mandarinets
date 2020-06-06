import { Configuration } from "../main-core/decorators/stereotypes/configuration/configuration.ts";
import { Mandarine } from "../main-core/Mandarine.ns.ts";
import { ResourceHandler } from "../mvc-framework/core/internal/components/resource-handler-registry/resourceHandler.ts";
import { MandarineResourceResolver, MandarineCore } from "../mod.ts";
import { Injectable } from "../main-core/dependency-injection/decorators/injectable.ts";

@Configuration()
export class WebMVCConfigurer implements Mandarine.MandarineMVC.Configurers.WebMVCConfigurer {

    @Injectable()
    public addResourceHandlers(): Mandarine.MandarineCore.IResourceHandlerRegistry {
        let resourceHandlerRegistry = Mandarine.Global.getResourceHandlerRegistry().getNew();
        
        resourceHandlerRegistry.addResourceHandler(
            new ResourceHandler()
            .addResourceHandler(new RegExp("/static/(.*)"))
            .addResourceHandlerLocation("./src/main/resources/static/newStatic")
            .addResourceResolver(new MandarineResourceResolver())
        ).addResourceHandler(
            new ResourceHandler()
            .addResourceHandler(new RegExp("/static2/(.*)"))
            .addResourceHandlerLocation("./src/main/resources/static")
            .addResourceResolver(new MandarineResourceResolver())
        );

        return resourceHandlerRegistry;
    }

}

new MandarineCore().MVC().run();