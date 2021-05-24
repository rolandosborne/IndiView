package org.coredb.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * Entry
 */
@Validated


public class Entry   {
  @JsonProperty("name")
  private String name = null;

  @JsonProperty("stringValue")
  private String stringValue = null;

  @JsonProperty("numValue")
  private Long numValue = null;

  @JsonProperty("boolValue")
  private Boolean boolValue = null;

  public Entry name(String name) {
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

  public Entry stringValue(String stringValue) {
    this.stringValue = stringValue;
    return this;
  }

  /**
   * Get stringValue
   * @return stringValue
   **/
  @Schema(description = "")
  
    public String getStringValue() {
    return stringValue;
  }

  public void setStringValue(String stringValue) {
    this.stringValue = stringValue;
  }

  public Entry numValue(Long numValue) {
    this.numValue = numValue;
    return this;
  }

  /**
   * Get numValue
   * @return numValue
   **/
  @Schema(description = "")
  
    public Long getNumValue() {
    return numValue;
  }

  public void setNumValue(Long numValue) {
    this.numValue = numValue;
  }

  public Entry boolValue(Boolean boolValue) {
    this.boolValue = boolValue;
    return this;
  }

  /**
   * Get boolValue
   * @return boolValue
   **/
  @Schema(description = "")
  
    public Boolean isBoolValue() {
    return boolValue;
  }

  public void setBoolValue(Boolean boolValue) {
    this.boolValue = boolValue;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Entry entry = (Entry) o;
    return Objects.equals(this.name, entry.name) &&
        Objects.equals(this.stringValue, entry.stringValue) &&
        Objects.equals(this.numValue, entry.numValue) &&
        Objects.equals(this.boolValue, entry.boolValue);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name, stringValue, numValue, boolValue);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Entry {\n");
    
    sb.append("    name: ").append(toIndentedString(name)).append("\n");
    sb.append("    stringValue: ").append(toIndentedString(stringValue)).append("\n");
    sb.append("    numValue: ").append(toIndentedString(numValue)).append("\n");
    sb.append("    boolValue: ").append(toIndentedString(boolValue)).append("\n");
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
