package com.porter.contacts.services;

import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.people.v1.PeopleService;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.stereotype.Service;

@Service
public class GoogleService {

    private final OAuth2AuthorizedClientService clientService;

    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    public GoogleService(OAuth2AuthorizedClientService clientService) {
        this.clientService = clientService;
    }

    public String getAccessToken(Authentication auth) {
        if (!(auth instanceof OAuth2AuthenticationToken)) {
            throw new RuntimeException("Authentication is not OAuth2AuthenticationToken");
        }
    
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) auth;
        String registrationId = oauthToken.getAuthorizedClientRegistrationId();
    
        OAuth2AuthorizedClient authorizedClient = clientService.loadAuthorizedClient(registrationId, oauthToken.getName());
    
        if (authorizedClient == null) {
            throw new RuntimeException("OAuth2AuthorizedClient not found. User may not be authenticated.");
        }
    
        OAuth2AccessToken accessToken = authorizedClient.getAccessToken();
        
        if (accessToken == null || accessToken.getTokenValue().isEmpty()) {
            throw new RuntimeException("Access token is null or empty.");
        }
    
        return accessToken.getTokenValue();
    }

    public PeopleService getPeopleService(String accessToken) throws Exception {
        HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        HttpRequestInitializer requestInitializer = request -> {
            request.setInterceptor(httpRequest -> {
                httpRequest.getHeaders().setAuthorization("Bearer " + accessToken);
            });
        };

    return new PeopleService.Builder(httpTransport, JSON_FACTORY, requestInitializer)
            .setApplicationName("ContactsApplication")
            .build();
}
}
