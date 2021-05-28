package org.coredb.view;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.Instant;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

@Component
public class ScheduledTasks {

  private long intervalCount = 0;

  @Value("${app.enable.scheduling:true}")
  private boolean enable;

  @Scheduled(fixedRate = 60000)
  public void reportCurrentTime() {

    if(enable) {
      intervalCount++;
    }
  }
}

