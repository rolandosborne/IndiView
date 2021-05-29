package org.coredb.view.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import org.coredb.view.model.AmigoMessage;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * LinkMessage
 */
@Validated
public class LinkMessage   {
  @JsonProperty("amigo")
  private AmigoMessage amigo = null;

  @JsonProperty("signature")
  private String signature = null;

  @JsonProperty("create")
  private String create = null;

  @JsonProperty("attach")
  private String attach = null;

  public LinkMessage amigo(AmigoMessage amigo) {
    this.amigo = amigo;
    return this;
  }

  /**
   * Get amigo
   * @return amigo
  **/
  @ApiModelProperty(required = true, value = "")
  @NotNull

  @Valid
  public AmigoMessage getAmigo() {
    return amigo;
  }

  public void setAmigo(AmigoMessage amigo) {
    this.amigo = amigo;
  }

  public LinkMessage signature(String signature) {
    this.signature = signature;
    return this;
  }

  /**
   * Get signature
   * @return signature
  **/
  @ApiModelProperty(required = true, value = "")
  @NotNull

  public String getSignature() {
    return signature;
  }

  public void setSignature(String signature) {
    this.signature = signature;
  }

  public LinkMessage create(String create) {
    this.create = create;
    return this;
  }

  /**
   * Get create
   * @return create
  **/
  @ApiModelProperty(value = "")

  public String getCreate() {
    return create;
  }

  public void setCreate(String create) {
    this.create = create;
  }

  public LinkMessage attach(String attach) {
    this.attach = attach;
    return this;
  }

  /**
   * Get attach
   * @return attach
  **/
  @ApiModelProperty(value = "")

  public String getAttach() {
    return attach;
  }

  public void setAttach(String attach) {
    this.attach = attach;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    LinkMessage linkMessage = (LinkMessage) o;
    return Objects.equals(this.amigo, linkMessage.amigo) &&
        Objects.equals(this.signature, linkMessage.signature) &&
        Objects.equals(this.create, linkMessage.create) &&
        Objects.equals(this.attach, linkMessage.attach);
  }

  @Override
  public int hashCode() {
    return Objects.hash(amigo, signature, create, attach);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class LinkMessage {\n");
    
    sb.append("    amigo: ").append(toIndentedString(amigo)).append("\n");
    sb.append("    signature: ").append(toIndentedString(signature)).append("\n");
    sb.append("    create: ").append(toIndentedString(create)).append("\n");
    sb.append("    attach: ").append(toIndentedString(attach)).append("\n");
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

