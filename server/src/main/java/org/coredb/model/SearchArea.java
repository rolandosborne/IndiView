package org.coredb.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.coredb.model.GpsLocation;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * SearchArea
 */
@Validated


public class SearchArea   {
  @JsonProperty("min")
  private GpsLocation min = null;

  @JsonProperty("max")
  private GpsLocation max = null;

  public SearchArea min(GpsLocation min) {
    this.min = min;
    return this;
  }

  /**
   * Get min
   * @return min
   **/
  @Schema(required = true, description = "")
      @NotNull

    @Valid
    public GpsLocation getMin() {
    return min;
  }

  public void setMin(GpsLocation min) {
    this.min = min;
  }

  public SearchArea max(GpsLocation max) {
    this.max = max;
    return this;
  }

  /**
   * Get max
   * @return max
   **/
  @Schema(required = true, description = "")
      @NotNull

    @Valid
    public GpsLocation getMax() {
    return max;
  }

  public void setMax(GpsLocation max) {
    this.max = max;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    SearchArea searchArea = (SearchArea) o;
    return Objects.equals(this.min, searchArea.min) &&
        Objects.equals(this.max, searchArea.max);
  }

  @Override
  public int hashCode() {
    return Objects.hash(min, max);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class SearchArea {\n");
    
    sb.append("    min: ").append(toIndentedString(min)).append("\n");
    sb.append("    max: ").append(toIndentedString(max)).append("\n");
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
