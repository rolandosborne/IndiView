package org.coredb.view.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * Amigo
 */
@Validated


public class Amigo   {
  @JsonProperty("amigoId")
  private String amigoId = null;

  @JsonProperty("name")
  private String name = null;

  @JsonProperty("description")
  private String description = null;

  @JsonProperty("logo")
  private String logo = null;

  @JsonProperty("location")
  private String location = null;

  @JsonProperty("node")
  private String node = null;

  @JsonProperty("registry")
  private String registry = null;

  @JsonProperty("revision")
  private Integer revision = null;

  @JsonProperty("version")
  private String version = null;

  @JsonProperty("handle")
  private String handle = null;

  public Amigo amigoId(String amigoId) {
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

  public Amigo name(String name) {
    this.name = name;
    return this;
  }

  /**
   * Get name
   * @return name
   **/
  @Schema(description = "")
  
    public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Amigo description(String description) {
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

  public Amigo logo(String logo) {
    this.logo = logo;
    return this;
  }

  /**
   * Get logo
   * @return logo
   **/
  @Schema(description = "")
  
    public String getLogo() {
    return logo;
  }

  public void setLogo(String logo) {
    this.logo = logo;
  }

  public Amigo location(String location) {
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

  public Amigo node(String node) {
    this.node = node;
    return this;
  }

  /**
   * Get node
   * @return node
   **/
  @Schema(example = "https://node.coredb.org:9999/app", required = true, description = "")
      @NotNull

    public String getNode() {
    return node;
  }

  public void setNode(String node) {
    this.node = node;
  }

  public Amigo registry(String registry) {
    this.registry = registry;
    return this;
  }

  /**
   * Get registry
   * @return registry
   **/
  @Schema(example = "https://registry.coredb.org:8888/app", description = "")
  
    public String getRegistry() {
    return registry;
  }

  public void setRegistry(String registry) {
    this.registry = registry;
  }

  public Amigo revision(Integer revision) {
    this.revision = revision;
    return this;
  }

  /**
   * Get revision
   * @return revision
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Integer getRevision() {
    return revision;
  }

  public void setRevision(Integer revision) {
    this.revision = revision;
  }

  public Amigo version(String version) {
    this.version = version;
    return this;
  }

  /**
   * Get version
   * @return version
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getVersion() {
    return version;
  }

  public void setVersion(String version) {
    this.version = version;
  }

  public Amigo handle(String handle) {
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


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Amigo amigo = (Amigo) o;
    return Objects.equals(this.amigoId, amigo.amigoId) &&
        Objects.equals(this.name, amigo.name) &&
        Objects.equals(this.description, amigo.description) &&
        Objects.equals(this.logo, amigo.logo) &&
        Objects.equals(this.location, amigo.location) &&
        Objects.equals(this.node, amigo.node) &&
        Objects.equals(this.registry, amigo.registry) &&
        Objects.equals(this.revision, amigo.revision) &&
        Objects.equals(this.version, amigo.version) &&
        Objects.equals(this.handle, amigo.handle);
  }

  @Override
  public int hashCode() {
    return Objects.hash(amigoId, name, description, logo, location, node, registry, revision, version, handle);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Amigo {\n");
    
    sb.append("    amigoId: ").append(toIndentedString(amigoId)).append("\n");
    sb.append("    name: ").append(toIndentedString(name)).append("\n");
    sb.append("    description: ").append(toIndentedString(description)).append("\n");
    sb.append("    logo: ").append(toIndentedString(logo)).append("\n");
    sb.append("    location: ").append(toIndentedString(location)).append("\n");
    sb.append("    node: ").append(toIndentedString(node)).append("\n");
    sb.append("    registry: ").append(toIndentedString(registry)).append("\n");
    sb.append("    revision: ").append(toIndentedString(revision)).append("\n");
    sb.append("    version: ").append(toIndentedString(version)).append("\n");
    sb.append("    handle: ").append(toIndentedString(handle)).append("\n");
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

