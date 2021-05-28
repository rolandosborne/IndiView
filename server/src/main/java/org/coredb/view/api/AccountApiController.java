package org.coredb.view.api;

import org.coredb.view.model.Contact;
import org.coredb.view.model.GpsLocation;
import org.coredb.view.model.Login;
import org.coredb.view.model.Settings;
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
public class AccountApiController implements AccountApi {

    private static final Logger log = LoggerFactory.getLogger(AccountApiController.class);

    private final ObjectMapper objectMapper;

    private final HttpServletRequest request;

    @org.springframework.beans.factory.annotation.Autowired
    public AccountApiController(ObjectMapper objectMapper, HttpServletRequest request) {
        this.objectMapper = objectMapper;
        this.request = request;
    }

    public ResponseEntity<Login> attach(@NotNull @Parameter(in = ParameterIn.QUERY, description = "id of identity" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "amigoId", required = true) String amigoId,@NotNull @Parameter(in = ParameterIn.QUERY, description = "registry used by identity" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "registry", required = true) String registry,@NotNull @Parameter(in = ParameterIn.QUERY, description = "attachment code for access" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "code", required = true) String code) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<Login>(objectMapper.readValue("{\n  \"nodeToken\" : \"nodeToken\",\n  \"appToken\" : \"appToken\",\n  \"serviceNode\" : \"serviceNode\",\n  \"serviceToken\" : \"serviceToken\"\n}", Login.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<Login>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<Login>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Integer> getIdentity(@NotNull @Parameter(in = ParameterIn.QUERY, description = "app token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<Integer>(objectMapper.readValue("0", Integer.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<Integer>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<Integer>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<List<Contact>> getMatching(@NotNull @Parameter(in = ParameterIn.QUERY, description = "app token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@NotNull @Parameter(in = ParameterIn.QUERY, description = "text to search on" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "match", required = true) String match) {
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

    public ResponseEntity<List<Contact>> getNearby(@NotNull @Parameter(in = ParameterIn.QUERY, description = "app token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@Parameter(in = ParameterIn.DEFAULT, description = "updated configuration", required=true, schema=@Schema()) @Valid @RequestBody GpsLocation body,@Parameter(in = ParameterIn.QUERY, description = "range of matching values" ,schema=@Schema()) @Valid @RequestParam(value = "longitudeDelta", required = false) Integer longitudeDelta,@Parameter(in = ParameterIn.QUERY, description = "range of matching values" ,schema=@Schema()) @Valid @RequestParam(value = "latitudeDelta", required = false) Integer latitudeDelta,@Parameter(in = ParameterIn.QUERY, description = "range of matching values" ,schema=@Schema()) @Valid @RequestParam(value = "altitudeDelta", required = false) Integer altitudeDelta) {
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

    public ResponseEntity<Settings> getSettings(@NotNull @Parameter(in = ParameterIn.QUERY, description = "app token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<Settings>(objectMapper.readValue("{\n  \"videoMute\" : true,\n  \"audioQuality\" : \"audioQuality\",\n  \"audioMute\" : true,\n  \"searchable\" : true,\n  \"videoQuality\" : \"videoQuality\"\n}", Settings.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<Settings>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<Settings>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<String> report(@NotNull @Parameter(in = ParameterIn.QUERY, description = "app token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@NotNull @Parameter(in = ParameterIn.QUERY, description = "id of reported account" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "amigoId", required = true) String amigoId) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<String>(objectMapper.readValue("\"\"", String.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<String>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<String>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Integer> setIdentity(@NotNull @Parameter(in = ParameterIn.QUERY, description = "app token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@NotNull @Parameter(in = ParameterIn.QUERY, description = "registry holding public profile" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "registry", required = true) String registry) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<Integer>(objectMapper.readValue("0", Integer.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<Integer>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<Integer>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Void> setSettings(@NotNull @Parameter(in = ParameterIn.QUERY, description = "app token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@Parameter(in = ParameterIn.DEFAULT, description = "updated configuration", required=true, schema=@Schema()) @Valid @RequestBody Settings body) {
        String accept = request.getHeader("Accept");
        return new ResponseEntity<Void>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<String> status(@NotNull @Parameter(in = ParameterIn.QUERY, description = "app token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<String>(objectMapper.readValue("\"\"", String.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<String>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<String>(HttpStatus.NOT_IMPLEMENTED);
    }

}
