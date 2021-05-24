package org.coredb.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.service.ApiInfo;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class SwaggerDocumentationConfig {

    @Bean
    public Docket customImplementation(){
        return new Docket(DocumentationType.OAS_30)
                .select()
                    .apis(RequestHandlerSelectors.basePackage("org.coredb.api"))
                    .build()
                .directModelSubstitute(org.threeten.bp.LocalDate.class, java.sql.Date.class)
                .directModelSubstitute(org.threeten.bp.OffsetDateTime.class, java.util.Date.class)
                .apiInfo(apiInfo());
    }

    ApiInfo apiInfo() {
        return new ApiInfoBuilder()
            .title("Digital Archive Emigo App Server API")
            .description("An interface to a emigo app of distributed nodes for personal storage. emigo-id - hex encoded sha256 of an emigo 4096 public key emigo-key - hex encoded public key")
            .license("Apache 2.0")
            .licenseUrl("http://www.apache.org/licenses/LICENSE-2.0.html")
            .termsOfServiceUrl("")
            .version("1.0.4")
            .contact(new Contact("","", "rosborne@coredb.org"))
            .build();
    }

    @Bean
    public OpenAPI openApi() {
        return new OpenAPI()
            .info(new Info()
                .title("Digital Archive Emigo App Server API")
                .description("An interface to a emigo app of distributed nodes for personal storage. emigo-id - hex encoded sha256 of an emigo 4096 public key emigo-key - hex encoded public key")
                .termsOfService("")
                .version("1.0.4")
                .license(new License()
                    .name("Apache 2.0")
                    .url("http://www.apache.org/licenses/LICENSE-2.0.html"))
                .contact(new io.swagger.v3.oas.models.info.Contact()
                    .email("rosborne@coredb.org")));
    }

}
