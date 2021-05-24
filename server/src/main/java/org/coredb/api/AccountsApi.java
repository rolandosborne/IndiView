/**
 * NOTE: This class is auto generated by the swagger code generator program (3.0.24).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package org.coredb.api;

import org.coredb.model.Emigo;
import org.coredb.model.EmigoLogin;
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

public interface AccountsApi {

    @Operation(summary = "", description = "Create new emigo account and in turn attach an existing db account", tags={ "accounts" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "201", description = "account created", content = @Content(schema = @Schema(implementation = EmigoLogin.class))),
        
        @ApiResponse(responseCode = "406", description = "account limit reached"),
        
        @ApiResponse(responseCode = "500", description = "internal server error") })
    @RequestMapping(value = "/accounts/attached",
        produces = { "application/json" }, 
        method = RequestMethod.POST)
    ResponseEntity<EmigoLogin> attachAccount(@NotNull @Parameter(in = ParameterIn.QUERY, description = "id of emigo to be attached" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "emigoId", required = true) String emigoId, @NotNull @Parameter(in = ParameterIn.QUERY, description = "single use code" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "code", required = true) String code, @NotNull @Parameter(in = ParameterIn.QUERY, description = "node to forward request to" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "node", required = true) String node, @NotNull @Parameter(in = ParameterIn.QUERY, description = "request issued time" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "timestamp", required = true) Long timestamp);


    @Operation(summary = "", description = "request revision of module data", tags={ "accounts" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "successful operation", content = @Content(schema = @Schema(implementation = Integer.class))),
        
        @ApiResponse(responseCode = "403", description = "access denied") })
    @RequestMapping(value = "/accounts/revision",
        produces = { "application/json" }, 
        method = RequestMethod.GET)
    ResponseEntity<Integer> getIdentityRevision(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token);


    @Operation(summary = "", description = "Update profile with registry message", tags={ "accounts" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "updated", content = @Content(schema = @Schema(implementation = Emigo.class))),
        
        @ApiResponse(responseCode = "400", description = "invalid message message received"),
        
        @ApiResponse(responseCode = "401", description = "invalid login token"),
        
        @ApiResponse(responseCode = "423", description = "account not enabled"),
        
        @ApiResponse(responseCode = "500", description = "internal server error"),
        
        @ApiResponse(responseCode = "503", description = "external server error") })
    @RequestMapping(value = "/accounts/registry",
        produces = { "application/json" }, 
        method = RequestMethod.PUT)
    ResponseEntity<Emigo> updateHandle(@NotNull @Parameter(in = ParameterIn.QUERY, description = "login token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token, @NotNull @Parameter(in = ParameterIn.QUERY, description = "registry base url" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "registry", required = true) String registry, @Parameter(in = ParameterIn.QUERY, description = "current revision" ,schema=@Schema()) @Valid @RequestParam(value = "revision", required = false) Integer revision);

}

