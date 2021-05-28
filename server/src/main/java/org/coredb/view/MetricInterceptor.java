package org.coredb.view;

import org.springframework.beans.factory.annotation.Autowired;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

@Component
public class MetricInterceptor implements HandlerInterceptor {

   @Override
   public boolean preHandle
      (HttpServletRequest request, HttpServletResponse response, Object handler)
      throws Exception {

      return true;
   }
   @Override
   public void postHandle(HttpServletRequest request, HttpServletResponse response,
      Object handler, ModelAndView modelAndView) throws Exception {
   }
   @Override
   public void afterCompletion
      (HttpServletRequest request, HttpServletResponse response, Object
      handler, Exception exception) throws Exception {
   }
}

