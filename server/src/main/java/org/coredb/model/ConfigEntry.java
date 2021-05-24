package org.coredb.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.coredb.model.Entry;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * ConfigEntry
 */
@Validated


public class ConfigEntry   {
  @JsonProperty("configId")
  private String configId = null;

  @JsonProperty("entry")
  private Entry entry = null;

  public ConfigEntry configId(String configId) {
    this.configId = configId;
    return this;
  }

  /**
   * Get configId
   * @return configId
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getConfigId() {
    return configId;
  }

  public void setConfigId(String configId) {
    this.configId = configId;
  }

  public ConfigEntry entry(Entry entry) {
    this.entry = entry;
    return this;
  }

  /**
   * Get entry
   * @return entry
   **/
  @Schema(required = true, description = "")
      @NotNull

    @Valid
    public Entry getEntry() {
    return entry;
  }

  public void setEntry(Entry entry) {
    this.entry = entry;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    ConfigEntry configEntry = (ConfigEntry) o;
    return Objects.equals(this.configId, configEntry.configId) &&
        Objects.equals(this.entry, configEntry.entry);
  }

  @Override
  public int hashCode() {
    return Objects.hash(configId, entry);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class ConfigEntry {\n");
    
    sb.append("    configId: ").append(toIndentedString(configId)).append("\n");
    sb.append("    entry: ").append(toIndentedString(entry)).append("\n");
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
