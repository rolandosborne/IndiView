package org.coredb.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * AccountStatus
 */
@Validated


public class AccountStatus   {
  @JsonProperty("total")
  private Long total = null;

  @JsonProperty("current")
  private Long current = null;

  public AccountStatus total(Long total) {
    this.total = total;
    return this;
  }

  /**
   * Get total
   * @return total
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Long getTotal() {
    return total;
  }

  public void setTotal(Long total) {
    this.total = total;
  }

  public AccountStatus current(Long current) {
    this.current = current;
    return this;
  }

  /**
   * Get current
   * @return current
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Long getCurrent() {
    return current;
  }

  public void setCurrent(Long current) {
    this.current = current;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    AccountStatus accountStatus = (AccountStatus) o;
    return Objects.equals(this.total, accountStatus.total) &&
        Objects.equals(this.current, accountStatus.current);
  }

  @Override
  public int hashCode() {
    return Objects.hash(total, current);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class AccountStatus {\n");
    
    sb.append("    total: ").append(toIndentedString(total)).append("\n");
    sb.append("    current: ").append(toIndentedString(current)).append("\n");
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
