package org.coredb.view.model;

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

  @JsonProperty("handle")
  private String handle = null;

  @JsonProperty("location")
  private String location = null;

  @JsonProperty("description")
  private String description = null;

  @JsonProperty("logoSet")
  private Boolean logoSet = null;

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

  public Contact handle(String handle) {
    this.handle = handle;
    return this;
  }

  /**
   * Get handle
   * @return handle
   **/
  @Schema(description = "")
  
    public String getHandle() {
    return handle;
  }

  public void setHandle(String handle) {
    this.handle = handle;
  }

  public Contact location(String location) {
    this.location = location;
    return this;
  }

  /**
   * Get location
   * @return location
   **/
  @Schema(description = "")
  
    public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public Contact description(String description) {
    this.description = description;
    return this;
  }

  /**
   * Get description
   * @return description
   **/
  @Schema(description = "")
  
    public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Contact logoSet(Boolean logoSet) {
    this.logoSet = logoSet;
    return this;
  }

  /**
   * Get logoSet
   * @return logoSet
   **/
  @Schema(description = "")
  
    public Boolean isLogoSet() {
    return logoSet;
  }

  public void setLogoSet(Boolean logoSet) {
    this.logoSet = logoSet;
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
        Objects.equals(this.name, contact.name) &&
        Objects.equals(this.handle, contact.handle) &&
        Objects.equals(this.location, contact.location) &&
        Objects.equals(this.description, contact.description) &&
        Objects.equals(this.logoSet, contact.logoSet);
  }

  @Override
  public int hashCode() {
    return Objects.hash(amigoId, registry, name, handle, location, description, logoSet);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Contact {\n");
    
    sb.append("    amigoId: ").append(toIndentedString(amigoId)).append("\n");
    sb.append("    registry: ").append(toIndentedString(registry)).append("\n");
    sb.append("    name: ").append(toIndentedString(name)).append("\n");
    sb.append("    handle: ").append(toIndentedString(handle)).append("\n");
    sb.append("    location: ").append(toIndentedString(location)).append("\n");
    sb.append("    description: ").append(toIndentedString(description)).append("\n");
    sb.append("    logoSet: ").append(toIndentedString(logoSet)).append("\n");
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

