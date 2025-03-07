package com.porter.contacts.controllers;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.google.api.services.people.v1.PeopleService;
import com.google.api.services.people.v1.model.EmailAddress;
import com.google.api.services.people.v1.model.Name;
import com.google.api.services.people.v1.model.Person;
import com.google.api.services.people.v1.model.PhoneNumber;
import com.google.api.services.people.v1.model.UpdateContactPhotoRequest;
import com.porter.contacts.services.GoogleService;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    @Autowired
    private GoogleService googleContactService;

    @PostMapping("/add")
    public ResponseEntity<String> addContact(@RequestParam String name, @RequestParam String email,
                                             @RequestParam String phone, OAuth2AuthenticationToken auth, @RequestParam(required = false) MultipartFile profilePicture) {
        try {
            String accessToken = googleContactService.getAccessToken(auth);
            PeopleService peopleService = googleContactService.getPeopleService(accessToken);

            Person newContact = new Person()
                .setNames(Collections.singletonList(new Name().setGivenName(name)))
                .setEmailAddresses(Collections.singletonList(new EmailAddress().setValue(email)))
                .setPhoneNumbers(Collections.singletonList(new PhoneNumber().setValue(phone)));

            Person createdContact = peopleService.people().createContact(newContact)
                .setPersonFields("names,emailAddresses,phoneNumbers")
                .execute();

            String contactId = createdContact.getResourceName();
                
            if (profilePicture != null && !profilePicture.isEmpty()) {
                InputStream inputStream = profilePicture.getInputStream();
                ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    byteArrayOutputStream.write(buffer, 0, bytesRead);
                }
                byte[] imageData = byteArrayOutputStream.toByteArray();

                UpdateContactPhotoRequest photoRequest = new UpdateContactPhotoRequest()
                    .encodePhotoBytes(imageData);
                
                peopleService.people().updateContactPhoto(contactId, photoRequest).execute();
            }
    
            return ResponseEntity.status(HttpStatus.FOUND).header("Location", "/account").build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding contact: " + e);
        }
    }

    @PostMapping("/update")
    public ResponseEntity<String> updateContact(@RequestParam String contactId, @RequestParam String name,
                                                @RequestParam String email, @RequestParam String phone, @RequestParam(required = false) MultipartFile profilePicture, OAuth2AuthenticationToken auth) {
        try {
            String accessToken = googleContactService.getAccessToken(auth);
            PeopleService peopleService = googleContactService.getPeopleService(accessToken);

            Person existingContact = peopleService.people().get(contactId)
                .setPersonFields("names,emailAddresses,phoneNumbers,photos") 
                .execute();
      
            Person updatedContact = new Person()
                .setNames(Collections.singletonList(new Name().setGivenName(name)))
                .setEmailAddresses(Collections.singletonList(new EmailAddress().setValue(email)))
                .setPhoneNumbers(Collections.singletonList(new PhoneNumber().setValue(phone)))
                .setEtag(existingContact.getEtag()); 
   
            peopleService.people().updateContact(contactId, updatedContact)
                .setUpdatePersonFields("names,emailAddresses,phoneNumbers")
                .execute();

            if (profilePicture != null && !profilePicture.isEmpty()) {
                InputStream inputStream = profilePicture.getInputStream();
                ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    byteArrayOutputStream.write(buffer, 0, bytesRead);
                }
                byte[] imageData = byteArrayOutputStream.toByteArray();

                UpdateContactPhotoRequest photoRequest = new UpdateContactPhotoRequest()
                    .encodePhotoBytes(imageData);
                
                peopleService.people().updateContactPhoto(contactId, photoRequest).execute();
            }

            return ResponseEntity.status(HttpStatus.FOUND).header("Location", "/account").build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating contact: " + e);
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<String> deleteContact(@RequestParam String contactId, OAuth2AuthenticationToken auth) {
        try {
            String accessToken = googleContactService.getAccessToken(auth);
            PeopleService peopleService = googleContactService.getPeopleService(accessToken);

            peopleService.people().deleteContact(contactId).execute();
            return ResponseEntity.status(HttpStatus.FOUND).header("Location", "/account").build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting contact: " + e);
        }
    }
}

