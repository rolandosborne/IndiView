/**
 * NOTE: This class is auto generated by the swagger code generator program (3.0.25).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package org.coredb.api;

import org.coredb.model.Contact;
import org.coredb.model.Params;
import org.coredb.model.Stats;
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

@Validated
public interface ConsoleApi {

    @Operation(summary = "", description = "Retrieve flagged users", tags={ "console" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "successful operation", content = @Content(array = @ArraySchema(schema = @Schema(implementation = Contact.class)))),
        
        @ApiResponse(responseCode = "404", description = "token not found"),
        
        @ApiResponse(responseCode = "500", description = "internal server error") })
    @RequestMapping(value = "/console/flagged",
        produces = { "application/json" }, 
        method = RequestMethod.GET)
    ResponseEntity<List<Contact>> getFlagged(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token);


    @Operation(summary = "", description = "Retrieve server params", tags={ "console" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "successful operation", content = @Content(schema = @Schema(implementation = Params.class))),
        
        @ApiResponse(responseCode = "404", description = "token not found"),
        
        @ApiResponse(responseCode = "500", description = "internal server error") })
    @RequestMapping(value = "/console/params",
        produces = { "application/json" }, 
        method = RequestMethod.GET)
    ResponseEntity<Params> getParams(@NotNull @Parameter(in = ParameterIn.QUERY, description = "console token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token);


    @Operation(summary = "", description = "Retrieve latest stats", tags={ "console" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "successful operation", content = @Content(array = @ArraySchema(schema = @Schema(implementation = Stats.class)))),
        
        @ApiResponse(responseCode = "404", description = "token not found"),
        
        @ApiResponse(responseCode = "500", description = "internal server error") })
    @RequestMapping(value = "/console/stats",
        produces = { "application/json" }, 
        method = RequestMethod.GET)
    ResponseEntity<List<Stats>> getStats(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token);


    @Operation(summary = "", description = "Set flagged user state", tags={ "console" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "201", description = "successful operation"),
        
        @ApiResponse(responseCode = "404", description = "token not found"),
        
        @ApiResponse(responseCode = "500", description = "internal server error") })
    @RequestMapping(value = "/console/flagged",
        method = RequestMethod.PUT)
    ResponseEntity<Void> setFlagged(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token, @Parameter(in = ParameterIn.QUERY, description = "reported state" ,schema=@Schema()) @Valid @RequestParam(value = "reported", required = false) Boolean reported, @Parameter(in = ParameterIn.QUERY, description = "blocked state" ,schema=@Schema()) @Valid @RequestParam(value = "blocked", required = false) Boolean blocked);


    @Operation(summary = "", description = "Update server params", tags={ "console" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "201", description = "successful operation"),
        
        @ApiResponse(responseCode = "404", description = "token not found"),
        
        @ApiResponse(responseCode = "500", description = "internal server error") })
    @RequestMapping(value = "/console/params",
        consumes = { "application/json" }, 
        method = RequestMethod.PUT)
    ResponseEntity<Void> setParams(@NotNull @Parameter(in = ParameterIn.QUERY, description = "console token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token, @Parameter(in = ParameterIn.DEFAULT, description = "updated configuration", required=true, schema=@Schema()) @Valid @RequestBody Params body);


    @Operation(summary = "", description = "Add new server stat", tags={ "console" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "successful operation"),
        
        @ApiResponse(responseCode = "403", description = "access denied") })
    @RequestMapping(value = "/console/stats",
        method = RequestMethod.POST)
    ResponseEntity<Void> setStats(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token, @NotNull @Min(0) @Max(100) @Parameter(in = ParameterIn.QUERY, description = "time" ,required=true,schema=@Schema(allowableValues={  }, maximum="100"
)) @Valid @RequestParam(value = "processor", required = true) Integer processor, @NotNull @Parameter(in = ParameterIn.QUERY, description = "current memory free" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "memory", required = true) Long memory, @NotNull @Parameter(in = ParameterIn.QUERY, description = "current storage free" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "storage", required = true) Long storage);

}

