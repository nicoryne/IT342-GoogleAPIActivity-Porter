package com.porter.contacts.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable()) 
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/contacts/add", "/contacts/delete", "/contacts/update").authenticated() // Protect contact management
                    .anyRequest().permitAll())
                .oauth2Login(oauth2 -> oauth2.defaultSuccessUrl("/account", true))
                .logout(logout -> logout.logoutSuccessUrl("/"))
                .build();
    }
}
