package org.coredb.view.jpa.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.coredb.view.jpa.entity.Account;

public interface AccountRepository extends JpaRepository<Account, Integer>, JpaSpecificationExecutor<Account> 
 {
  List<Account> findAll();
  Account findOneByAmigoId(String amigoId);
  Account findOneByToken(String loginToken);
  long count();
}

