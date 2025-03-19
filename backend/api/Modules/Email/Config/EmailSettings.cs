namespace api.Modules.Email.Config;

public class EmailSettings
{
    public string DefaultFromEmail { get; set; } = "noreply@kobo.gg";
    public string DefaultFromName { get; set; } = "Kobo.gg";
}

public class MailcatcherSettings : EmailSettings
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 1025;
}

public class BrevoSettings : EmailSettings
{
    public string ApiKey { get; set; } = string.Empty;
}

public class SendgridSettings : EmailSettings
{
    public string ApiKey { get; set; } = string.Empty;
}