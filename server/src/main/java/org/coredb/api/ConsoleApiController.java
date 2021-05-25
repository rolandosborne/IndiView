package org.coredb.api;

import org.coredb.model.Contact;
import org.coredb.model.Params;
import org.coredb.model.Stats;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.*;
import javax.validation.Valid;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
public class ConsoleApiController implements ConsoleApi {

    private static final Logger log = LoggerFactory.getLogger(ConsoleApiController.class);

    private final ObjectMapper objectMapper;

    private final HttpServletRequest request;

    @org.springframework.beans.factory.annotation.Autowired
    public ConsoleApiController(ObjectMapper objectMapper, HttpServletRequest request) {
        this.objectMapper = objectMapper;
        this.request = request;
    }

    public ResponseEntity<List<Contact>> getFlagged(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<List<Contact>>(objectMapper.readValue("[ {\n  \"registry\" : \"registry\",\n  \"amigoId\" : \"amigoId\"\n}, {\n  \"registry\" : \"registry\",\n  \"amigoId\" : \"amigoId\"\n} ]", List.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<List<Contact>>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<List<Contact>>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Params> getParams(@NotNull @Parameter(in = ParameterIn.QUERY, description = "console token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<Params>(objectMapper.readValue("{\n  \"serviceNode\" : \"serviceNode\",\n  \"serviceToken\" : \"serviceToken\"\n}", Params.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<Params>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<Params>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<List<Stats>> getStats(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<List<Stats>>(objectMapper.readValue("[ {\n  \"memory\" : 1,\n  \"storage\" : 5,\n  \"requests\" : 5,\n  \"accounts\" : 2,\n  \"processor\" : 6,\n  \"timestamp\" : 0\n}, {\n  \"memory\" : 1,\n  \"storage\" : 5,\n  \"requests\" : 5,\n  \"accounts\" : 2,\n  \"processor\" : 6,\n  \"timestamp\" : 0\n} ]", List.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<List<Stats>>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<List<Stats>>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Void> setFlagged(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@Parameter(in = ParameterIn.QUERY, description = "reported state" ,schema=@Schema()) @Valid @RequestParam(value = "reported", required = false) Boolean reported,@Parameter(in = ParameterIn.QUERY, description = "blocked state" ,schema=@Schema()) @Valid @RequestParam(value = "blocked", required = false) Boolean blocked) {
        String accept = request.getHeader("Accept");
        return new ResponseEntity<Void>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Void> setParams(@NotNull @Parameter(in = ParameterIn.QUERY, description = "console token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@Parameter(in = ParameterIn.DEFAULT, description = "updated configuration", required=true, schema=@Schema()) @Valid @RequestBody Params body) {
        String accept = request.getHeader("Accept");
        return new ResponseEntity<Void>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Void> setStats(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@NotNull @Min(0) @Max(100) @Parameter(in = ParameterIn.QUERY, description = "time" ,required=true,schema=@Schema(allowableValues={  }, maximum="100"
)) @Valid @RequestParam(value = "processor", required = true) Integer processor,@NotNull @Parameter(in = ParameterIn.QUERY, description = "current memory free" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "memory", required = true) Long memory,@NotNull @Parameter(in = ParameterIn.QUERY, description = "current storage free" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "storage", required = true) Long storage) {
        String accept = request.getHeader("Accept");
        return new ResponseEntity<Void>(HttpStatus.NOT_IMPLEMENTED);
    }

}
