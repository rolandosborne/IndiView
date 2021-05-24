package org.coredb.api;

import java.math.BigDecimal;
import org.coredb.model.GpsLocation;
import org.coredb.model.Profile;
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
public class ProfileApiController implements ProfileApi {

    private static final Logger log = LoggerFactory.getLogger(ProfileApiController.class);

    private final ObjectMapper objectMapper;

    private final HttpServletRequest request;

    @org.springframework.beans.factory.annotation.Autowired
    public ProfileApiController(ObjectMapper objectMapper, HttpServletRequest request) {
        this.objectMapper = objectMapper;
        this.request = request;
    }

    public ResponseEntity<Profile> availableProfile(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@NotNull @Parameter(in = ParameterIn.QUERY, description = "whether account is searchable" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "flag", required = true) Boolean flag) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<Profile>(objectMapper.readValue("{\n  \"gpsLongitude\" : 1.4658129,\n  \"available\" : true,\n  \"gps\" : true,\n  \"gpsTimestamp\" : 6.027456183070403,\n  \"searchable\" : true,\n  \"revision\" : 0.8008281904610115,\n  \"gpsLatitude\" : 5.962134\n}", Profile.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<Profile>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<Profile>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Profile> getProfile(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<Profile>(objectMapper.readValue("{\n  \"gpsLongitude\" : 1.4658129,\n  \"available\" : true,\n  \"gps\" : true,\n  \"gpsTimestamp\" : 6.027456183070403,\n  \"searchable\" : true,\n  \"revision\" : 0.8008281904610115,\n  \"gpsLatitude\" : 5.962134\n}", Profile.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<Profile>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<Profile>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Integer> getProfileRevision(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token) {
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

    public ResponseEntity<Profile> gpsProfile(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@Parameter(in = ParameterIn.DEFAULT, description = "emigo to insert", required=true, schema=@Schema()) @Valid @RequestBody GpsLocation body,@Parameter(in = ParameterIn.QUERY, description = "expiration of location" ,schema=@Schema()) @Valid @RequestParam(value = "expires", required = false) BigDecimal expires) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<Profile>(objectMapper.readValue("{\n  \"gpsLongitude\" : 1.4658129,\n  \"available\" : true,\n  \"gps\" : true,\n  \"gpsTimestamp\" : 6.027456183070403,\n  \"searchable\" : true,\n  \"revision\" : 0.8008281904610115,\n  \"gpsLatitude\" : 5.962134\n}", Profile.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<Profile>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<Profile>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Profile> searchableProfile(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@NotNull @Parameter(in = ParameterIn.QUERY, description = "whether account is searchable" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "flag", required = true) Boolean flag) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<Profile>(objectMapper.readValue("{\n  \"gpsLongitude\" : 1.4658129,\n  \"available\" : true,\n  \"gps\" : true,\n  \"gpsTimestamp\" : 6.027456183070403,\n  \"searchable\" : true,\n  \"revision\" : 0.8008281904610115,\n  \"gpsLatitude\" : 5.962134\n}", Profile.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<Profile>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<Profile>(HttpStatus.NOT_IMPLEMENTED);
    }

}
