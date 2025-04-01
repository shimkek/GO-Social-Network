package mailer

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"strings"
	"time"

	"github.com/resend/resend-go/v2"
)

type EmailData struct {
	Name  string
	Email string
}

func (e *EmailData) Format() string {
	return fmt.Sprintf("%s <%s>", strings.TrimSpace(e.Name), strings.TrimSpace(strings.ToLower(e.Email)))
}

type resendMailer struct {
	client *resend.Client
	sender EmailData
}

func NewResend(apiKey, fromEmail, fromName string) *resendMailer {
	client := resend.NewClient(apiKey)

	return &resendMailer{
		client: client,
		sender: EmailData{
			Name:  fromName,
			Email: fromEmail,
		},
	}
}

func (m *resendMailer) Send(templateFile string, recipient EmailData, data any) error {

	tmpl, err := template.ParseFS(FS, "templates/"+templateFile)
	if err != nil {
		return err
	}

	subject := new(bytes.Buffer)
	err = tmpl.ExecuteTemplate(subject, "subject", data)
	if err != nil {
		return err
	}

	body := new(bytes.Buffer)
	err = tmpl.ExecuteTemplate(body, "body", data)
	if err != nil {
		return err
	}

	msg := &resend.SendEmailRequest{
		From:    m.sender.Format(),
		To:      []string{recipient.Format()},
		Subject: subject.String(),
		Html:    body.String(),
	}

	for i := 0; i < maxRetries; i++ {
		response, err := m.client.Emails.Send(msg)
		if err != nil {
			log.Printf("Failed to sent email to %v, attempt %d of %d", recipient.Format(), i+1, maxRetries)
			log.Printf("Error: %v", err.Error())

			time.Sleep(time.Second * time.Duration(i*2))
			continue
		}
		log.Printf("Email sent with status code %v", response.Id)
		return nil
	}

	return fmt.Errorf("failed to send email after %d attempts", maxRetries)
}
