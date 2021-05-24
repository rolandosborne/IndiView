package org.coredb.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * EmigoMessage
 */
@Validated


public class EmigoMessage   {
  @JsonProperty("key")
  private String key = null;

  @JsonProperty("keyType")
  private String keyType = null;

  @JsonProperty("signature")
  private String signature = null;

  @JsonProperty("data")
  private String data = null;

  public EmigoMessage key(String key) {
    this.key = key;
    return this;
  }

  /**
   * Get key
   * @return key
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getKey() {
    return key;
  }

  public void setKey(String key) {
    this.key = key;
  }

  public EmigoMessage keyType(String keyType) {
    this.keyType = keyType;
    return this;
  }

  /**
   * Get keyType
   * @return keyType
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getKeyType() {
    return keyType;
  }

  public void setKeyType(String keyType) {
    this.keyType = keyType;
  }

  public EmigoMessage signature(String signature) {
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

  public EmigoMessage data(String data) {
    this.data = data;
    return this;
  }

  /**
   * Get data
   * @return data
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getData() {
    return data;
  }

  public void setData(String data) {
    this.data = data;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    EmigoMessage emigoMessage = (EmigoMessage) o;
    return Objects.equals(this.key, emigoMessage.key) &&
        Objects.equals(this.keyType, emigoMessage.keyType) &&
        Objects.equals(this.signature, emigoMessage.signature) &&
        Objects.equals(this.data, emigoMessage.data);
  }

  @Override
  public int hashCode() {
    return Objects.hash(key, keyType, signature, data);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class EmigoMessage {\n");
    
    sb.append("    key: ").append(toIndentedString(key)).append("\n");
    sb.append("    keyType: ").append(toIndentedString(keyType)).append("\n");
    sb.append("    signature: ").append(toIndentedString(signature)).append("\n");
    sb.append("    data: ").append(toIndentedString(data)).append("\n");
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
