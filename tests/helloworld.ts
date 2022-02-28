import { MandarineCore, Controller, GET } from "../mod.ts"; 

@Controller('/api')
export class Boo {
     
    @GET('/hello-world')
    public helloWorld(): string {
        return "Hello World";
    }

}

new MandarineCore().MVC().run();

//request => http://localhost:4444/api/hello-world => Hello World
