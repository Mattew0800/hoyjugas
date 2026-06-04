package hoyjugas.Service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;
import com.google.api.services.gmail.model.Message;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import java.io.*;
import java.util.Collections;
import java.util.List;
import java.util.Properties;

@Service
public class GmailService {
    private Gmail service;

    @Value("${gmail.credentials.path}")
    private String credentialsPath;
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    private static final List<String> SCOPES =
            Collections.singletonList(GmailScopes.GMAIL_SEND);
    private static final String TOKENS_DIRECTORY_PATH = "tokens";

    @PostConstruct
    public void init() throws Exception {
        final NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();

        this.service = new Gmail.Builder(
                httpTransport,
                GsonFactory.getDefaultInstance(),
                getCredentials(httpTransport)
        ).setApplicationName("Gmail API Java").build();
    }

    private static final String SENDER_EMAIL = "HoyJugasSistema@gmail.com";

    public GmailService() {}

    public void sendEmail(String to, String subject, String htmlContent) throws Exception {

        MimeMessage email = createEmail(to, subject, htmlContent);

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        email.writeTo(buffer);

        String encodedEmail = Base64.encodeBase64URLSafeString(buffer.toByteArray());

        Message message = new Message();
        message.setRaw(encodedEmail);

        service.users().messages().send("me", message).execute();
    }

    private MimeMessage createEmail(String to, String subject, String htmlBody)
            throws MessagingException {
        Session session = Session.getDefaultInstance(new Properties());
        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress(GmailService.SENDER_EMAIL));
        email.addRecipient(jakarta.mail.Message.RecipientType.TO, new InternetAddress(to));
        email.setSubject(subject);
        email.setContent(htmlBody, "text/html; charset=utf-8");
        return email;
    }

    private Credential getCredentials(final NetHttpTransport HTTP_TRANSPORT) throws IOException {
        InputStream in = new ClassPathResource(credentialsPath).getInputStream();
        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(in));
        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                HTTP_TRANSPORT, JSON_FACTORY, clientSecrets, SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(new File(TOKENS_DIRECTORY_PATH)))
                .setAccessType("offline")
                .build();
        LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(8888).build();
        return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
    }

    public void sendPasswordResetEmail(String to, String resetLink) throws Exception {

        String subject = "Recuperación de contraseña";
        String htmlContent = """
        <div style="font-family: Arial; padding: 20px;">
            <h2>Recuperar contraseña</h2>
            <p>Hacé click en el siguiente botón para cambiar tu contraseña:</p>
            <a href="%s" 
               style="background-color:#007bff;color:white;padding:10px 15px;
               text-decoration:none;border-radius:5px;">
               Cambiar contraseña
            </a>
            <p style="margin-top:20px;">Este link expira en 30 minutos.</p>
        </div>
        """.formatted(resetLink);
        sendEmail(to, subject, htmlContent);
    }
}
