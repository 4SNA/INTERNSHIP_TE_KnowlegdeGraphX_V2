package com.knowledgegraphx.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableAsync
public class KnowledgeGraphXApplication {

	private static final Logger log = LoggerFactory.getLogger(KnowledgeGraphXApplication.class);

	public static void main(String[] args) {
		io.github.cdimascio.dotenv.Dotenv dotenv = io.github.cdimascio.dotenv.Dotenv.configure()
				.directory("..") // Load from project root
				.ignoreIfMissing()
				.load();
		
		dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
		
		SpringApplication.run(KnowledgeGraphXApplication.class, args);
	}

	@Bean
	public CommandLineRunner verifyEnv(@org.springframework.beans.factory.annotation.Value("${spring.security.oauth2.client.registration.google.client-id}") String googleId) {
		return args -> {
			if (googleId != null && !googleId.contains("YOUR_GOOGLE_CLIENT_ID")) {
				log.info("OAuth Registry: Google Client ID loaded correctly (Length: {}, Suffix: ...{})", 
					googleId.length(), 
					googleId.substring(googleId.length() - 10));
			} else {
				log.error("OAuth Registry: Google Client ID is MISSING or using PLACEHOLDERS!");
			}
		};
	}
}
