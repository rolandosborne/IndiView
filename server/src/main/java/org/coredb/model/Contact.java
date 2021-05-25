package org.coredb.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * Contact
 */
@Validated


public class Contact   {
  @JsonProperty("amigoId")
  private String amigoId = null;

  @JsonProperty("registry")
  private String registry = null;

  @JsonProperty("name")
  private String name = null;

  public Contact amigoId(String amigoId) {
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

  public Contact registry(String registry) {
    this.registry = registry;
    return this;
  }

  /**
   * Get registry
   * @return registry
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getRegistry() {
    return registry;
  }

  public void setRegistry(String registry) {
    this.registry = registry;
  }

  public Contact name(String name) {
    this.name = name;
    return this;
  }

  /**
   * Get name
   * @return name
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Contact contact = (Contact) o;
    return Objects.equals(this.amigoId, contact.amigoId) &&
        Objects.equals(this.registry, contact.registry) &&
        Objects.equals(this.name, contact.name);
  }

  @Override
  public int hashCode() {
    return Objects.hash(amigoId, registry, name);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Contact {\n");
    
    sb.append("    amigoId: ").append(toIndentedString(amigoId)).append("\n");
    sb.append("    registry: ").append(toIndentedString(registry)).append("\n");
    sb.append("    name: ").append(toIndentedString(name)).append("\n");
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

