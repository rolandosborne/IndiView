package org.coredb.view.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * Stats
 */
@Validated


public class Stats   {
  @JsonProperty("timestamp")
  private Integer timestamp = null;

  @JsonProperty("processor")
  private Integer processor = null;

  @JsonProperty("memory")
  private Long memory = null;

  @JsonProperty("storage")
  private Long storage = null;

  @JsonProperty("requests")
  private Long requests = null;

  @JsonProperty("accounts")
  private Long accounts = null;

  public Stats timestamp(Integer timestamp) {
    this.timestamp = timestamp;
    return this;
  }

  /**
   * Get timestamp
   * @return timestamp
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Integer getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(Integer timestamp) {
    this.timestamp = timestamp;
  }

  public Stats processor(Integer processor) {
    this.processor = processor;
    return this;
  }

  /**
   * Get processor
   * @return processor
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Integer getProcessor() {
    return processor;
  }

  public void setProcessor(Integer processor) {
    this.processor = processor;
  }

  public Stats memory(Long memory) {
    this.memory = memory;
    return this;
  }

  /**
   * Get memory
   * @return memory
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Long getMemory() {
    return memory;
  }

  public void setMemory(Long memory) {
    this.memory = memory;
  }

  public Stats storage(Long storage) {
    this.storage = storage;
    return this;
  }

  /**
   * Get storage
   * @return storage
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Long getStorage() {
    return storage;
  }

  public void setStorage(Long storage) {
    this.storage = storage;
  }

  public Stats requests(Long requests) {
    this.requests = requests;
    return this;
  }

  /**
   * Get requests
   * @return requests
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Long getRequests() {
    return requests;
  }

  public void setRequests(Long requests) {
    this.requests = requests;
  }

  public Stats accounts(Long accounts) {
    this.accounts = accounts;
    return this;
  }

  /**
   * Get accounts
   * @return accounts
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Long getAccounts() {
    return accounts;
  }

  public void setAccounts(Long accounts) {
    this.accounts = accounts;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Stats stats = (Stats) o;
    return Objects.equals(this.timestamp, stats.timestamp) &&
        Objects.equals(this.processor, stats.processor) &&
        Objects.equals(this.memory, stats.memory) &&
        Objects.equals(this.storage, stats.storage) &&
        Objects.equals(this.requests, stats.requests) &&
        Objects.equals(this.accounts, stats.accounts);
  }

  @Override
  public int hashCode() {
    return Objects.hash(timestamp, processor, memory, storage, requests, accounts);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Stats {\n");
    
    sb.append("    timestamp: ").append(toIndentedString(timestamp)).append("\n");
    sb.append("    processor: ").append(toIndentedString(processor)).append("\n");
    sb.append("    memory: ").append(toIndentedString(memory)).append("\n");
    sb.append("    storage: ").append(toIndentedString(storage)).append("\n");
    sb.append("    requests: ").append(toIndentedString(requests)).append("\n");
    sb.append("    accounts: ").append(toIndentedString(accounts)).append("\n");
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
