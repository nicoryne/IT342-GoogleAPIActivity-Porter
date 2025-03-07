package com.porter.contacts.controllers;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.google.api.services.people.v1.PeopleService;
import com.google.api.services.people.v1.model.ListConnectionsResponse;
import com.google.api.services.people.v1.model.Person;
import com.porter.contacts.services.GoogleService;


@Controller
public class GoogleController {

    @Autowired
    private GoogleService googleContactService;

    @GetMapping()
    public String index() {
        return "index";
    }

    @GetMapping("/error")
    public String error() {
        return "index";
    }

    @GetMapping("/account")
    public String account(Model model, @AuthenticationPrincipal OAuth2User user, OAuth2AuthenticationToken auth) {
        if (user == null) {
            return "redirect:/";
        }

        model.addAttribute("userName", user.getAttribute("name"));
        model.addAttribute("userEmail", user.getAttribute("email"));
        model.addAttribute("userPicture", user.getAttribute("picture"));

        try {
            String accessToken = googleContactService.getAccessToken(auth);
            PeopleService peopleService = googleContactService.getPeopleService(accessToken);
            ListConnectionsResponse response = peopleService.people().connections()
                    .list("people/me")
                    .setPersonFields("names,emailAddresses,phoneNumbers,photos")
                    .setAccessToken(accessToken)
                    .execute();

            List<Person> contacts = response.getConnections();
            model.addAttribute("contacts", contacts != null ? contacts : Collections.emptyList());
            model.addAttribute("accessToken", accessToken);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching Google profile", e);
        }

        return "account";
    }
}


