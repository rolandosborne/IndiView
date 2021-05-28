package org.coredb.view.jpa.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.coredb.view.jpa.entity.Config;

public interface ConfigRepository extends JpaRepository<Config, Integer> {
  List<Config> findAll();
  Config findOneByConfigId(String id);
  Long deleteByConfigId(String id);
}


