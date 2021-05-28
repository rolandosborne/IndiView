package org.coredb.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.coredb.model.AmigoMessage;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * AmigoToken
 */
@Validated


public class AmigoToken   {
  @JsonProperty("amigoId")
  private String amigoId = null;

  @JsonProperty("amigo")
  private AmigoMessage amigo = null;

  @JsonProperty("signature")
  private String signature = null;

  @JsonProperty("token")
  private String token = null;

  public AmigoToken amigoId(String amigoId) {
    this.amigoId = amigoId;
    return this;
  }

  /**
   * Get amigoId
   * @return amigoId
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getAmigoId() {
    return amigoId;
  }

  public void setAmigoId(String amigoId) {
    this.amigoId = amigoId;
  }

  public AmigoToken amigo(AmigoMessage amigo) {
    this.amigo = amigo;
    return this;
  }

  /**
   * Get amigo
   * @return amigo
   **/
  @Schema(required = true, description = "")
      @NotNull

    @Valid
    public AmigoMessage getAmigo() {
    return amigo;
  }

  public void setAmigo(AmigoMessage amigo) {
    this.amigo = amigo;
  }

  public AmigoToken signature(String signature) {
    this.signature = signature;
    return this;
  }

  /**
   * Get signature
   * @return signature
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getSignature() {
    return signature;
  }

  public void setSignature(String signature) {
    this.signature = signature;
  }

  public AmigoToken token(String token) {
    this.token = token;
    return this;
  }

  /**
   * Get token
   * @return token
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    AmigoToken amigoToken = (AmigoToken) o;
    return Objects.equals(this.amigoId, amigoToken.amigoId) &&
        Objects.equals(this.amigo, amigoToken.amigo) &&
        Objects.equals(this.signature, amigoToken.signature) &&
        Objects.equals(this.token, amigoToken.token);
  }

  @Override
  public int hashCode() {
    return Objects.hash(amigoId, amigo, signature, token);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class AmigoToken {\n");
    
    sb.append("    amigoId: ").append(toIndentedString(amigoId)).append("\n");
    sb.append("    amigo: ").append(toIndentedString(amigo)).append("\n");
    sb.append("    signature: ").append(toIndentedString(signature)).append("\n");
    sb.append("    token: ").append(toIndentedString(token)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(java.lang.Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}

