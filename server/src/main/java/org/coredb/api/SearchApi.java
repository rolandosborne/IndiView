/**
 * NOTE: This class is auto generated by the swagger code generator program (3.0.24).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package org.coredb.api;

import java.math.BigDecimal;
import org.coredb.model.Contact;
import org.coredb.model.SearchArea;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.CookieValue;

import javax.validation.Valid;
import javax.validation.constraints.*;
import java.util.List;
import java.util.Map;

public interface SearchApi {

    @Operation(summary = "", description = "Search accounts according to location", tags={ "search" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "search executed", content = @Content(array = @ArraySchema(schema = @Schema(implementation = Contact.class)))),
        
        @ApiResponse(responseCode = "401", description = "invalid login token"),
        
        @ApiResponse(responseCode = "423", description = "account not enabled"),
        
        @ApiResponse(responseCode = "500", description = "internal server error") })
    @RequestMapping(value = "/search/accounts",
        produces = { "application/json" }, 
        consumes = { "application/json" }, 
        method = RequestMethod.POST)
    ResponseEntity<List<Contact>> scanAccounts(@NotNull @Parameter(in = ParameterIn.QUERY, description = "login token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token, @Parameter(in = ParameterIn.DEFAULT, description = "emigo to insert", required=true, schema=@Schema()) @Valid @RequestBody SearchArea body);


    @Operation(summary = "", description = "Search accounts according to criteria", tags={ "search" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "search executed", content = @Content(array = @ArraySchema(schema = @Schema(implementation = Contact.class)))),
        
        @ApiResponse(responseCode = "401", description = "invalid login token"),
        
        @ApiResponse(responseCode = "423", description = "account not enabled"),
        
        @ApiResponse(responseCode = "500", description = "internal server error") })
    @RequestMapping(value = "/search/accounts",
        produces = { "application/json" }, 
        method = RequestMethod.GET)
    ResponseEntity<List<Contact>> searchAccounts(@NotNull @Parameter(in = ParameterIn.QUERY, description = "login token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token, @NotNull  @DecimalMax("1024") @Parameter(in = ParameterIn.QUERY, description = "return max number of results" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "limit", required = true) BigDecimal limit, @Parameter(in = ParameterIn.QUERY, description = "or-set of matching name, handle, location, description" ,schema=@Schema()) @Valid @RequestParam(value = "match", required = false) String match, @Parameter(in = ParameterIn.QUERY, description = "filter with name like" ,schema=@Schema()) @Valid @RequestParam(value = "name", required = false) String name, @Parameter(in = ParameterIn.QUERY, description = "filter with handle like" ,schema=@Schema()) @Valid @RequestParam(value = "handle", required = false) String handle, @Parameter(in = ParameterIn.QUERY, description = "filter with description like" ,schema=@Schema()) @Valid @RequestParam(value = "description", required = false) String description, @Parameter(in = ParameterIn.QUERY, description = "filter with location like" ,schema=@Schema()) @Valid @RequestParam(value = "location", required = false) String location, @Parameter(in = ParameterIn.QUERY, description = "return results starting at offset" ,schema=@Schema()) @Valid @RequestParam(value = "offset", required = false) BigDecimal offset);

}

