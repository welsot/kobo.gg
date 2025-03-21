﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using api.Data;

#nullable disable

namespace api.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    partial class ApplicationDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.3")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("api.Modules.Kobo.Models.Book", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("created_at");

                    b.Property<string>("FileName")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)")
                        .HasColumnName("file_name");

                    b.Property<string>("FilePath")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("file_path");

                    b.Property<long>("FileSize")
                        .HasColumnType("bigint")
                        .HasColumnName("file_size");

                    b.Property<string>("OriginalFileName")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)")
                        .HasColumnName("original_file_name");

                    b.Property<Guid>("TmpBookBundleId")
                        .HasColumnType("uuid")
                        .HasColumnName("tmp_book_bundle_id");

                    b.HasKey("Id")
                        .HasName("pk_book");

                    b.HasIndex("TmpBookBundleId")
                        .HasDatabaseName("ix_book_tmp_book_bundle_id");

                    b.ToTable("book", (string)null);
                });

            modelBuilder.Entity("api.Modules.Kobo.Models.TmpBookBundle", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("created_at");

                    b.Property<DateTime>("ExpiresAt")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("expires_at");

                    b.Property<string>("ShortUrlCode")
                        .IsRequired()
                        .HasMaxLength(10)
                        .HasColumnType("character varying(10)")
                        .HasColumnName("short_url_code");

                    b.HasKey("Id")
                        .HasName("pk_tmp_book_bundle");

                    b.HasIndex("ShortUrlCode")
                        .IsUnique()
                        .HasDatabaseName("ix_tmp_book_bundle_short_url_code");

                    b.ToTable("tmp_book_bundle", (string)null);
                });

            modelBuilder.Entity("api.Modules.User.Models.ApiToken", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("created_at");

                    b.Property<string>("Token")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)")
                        .HasColumnName("token");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid")
                        .HasColumnName("user_id");

                    b.HasKey("Id")
                        .HasName("pk_api_token");

                    b.HasIndex("Token")
                        .IsUnique()
                        .HasDatabaseName("ix_api_token_token");

                    b.HasIndex("UserId")
                        .HasDatabaseName("ix_api_token_user_id");

                    b.ToTable("api_token", (string)null);
                });

            modelBuilder.Entity("api.Modules.User.Models.OneTimePassword", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasMaxLength(6)
                        .HasColumnType("character varying(6)")
                        .HasColumnName("code");

                    b.Property<DateTimeOffset>("ExpiresAt")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("expires_at");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid")
                        .HasColumnName("user_id");

                    b.HasKey("Id")
                        .HasName("pk_one_time_password");

                    b.HasIndex("UserId")
                        .HasDatabaseName("ix_one_time_password_user_id");

                    b.HasIndex("Code", "UserId")
                        .IsUnique()
                        .HasDatabaseName("ix_one_time_password_code_user_id");

                    b.ToTable("one_time_password", (string)null);
                });

            modelBuilder.Entity("api.Modules.User.Models.User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("created_at");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)")
                        .HasColumnName("email");

                    b.Property<bool>("IsEmailVerified")
                        .HasColumnType("boolean")
                        .HasColumnName("is_email_verified");

                    b.HasKey("Id")
                        .HasName("pk_users");

                    b.HasIndex("Email")
                        .IsUnique()
                        .HasDatabaseName("ix_users_email");

                    b.ToTable("users", (string)null);
                });

            modelBuilder.Entity("api.Modules.Kobo.Models.Book", b =>
                {
                    b.HasOne("api.Modules.Kobo.Models.TmpBookBundle", "TmpBookBundle")
                        .WithMany("Books")
                        .HasForeignKey("TmpBookBundleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_book_tmp_book_bundle_tmp_book_bundle_id");

                    b.Navigation("TmpBookBundle");
                });

            modelBuilder.Entity("api.Modules.User.Models.ApiToken", b =>
                {
                    b.HasOne("api.Modules.User.Models.User", "User")
                        .WithMany("ApiTokens")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_api_token_users_user_id");

                    b.Navigation("User");
                });

            modelBuilder.Entity("api.Modules.User.Models.OneTimePassword", b =>
                {
                    b.HasOne("api.Modules.User.Models.User", "User")
                        .WithMany("OneTimePasswords")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_one_time_password_users_user_id");

                    b.Navigation("User");
                });

            modelBuilder.Entity("api.Modules.Kobo.Models.TmpBookBundle", b =>
                {
                    b.Navigation("Books");
                });

            modelBuilder.Entity("api.Modules.User.Models.User", b =>
                {
                    b.Navigation("ApiTokens");

                    b.Navigation("OneTimePasswords");
                });
#pragma warning restore 612, 618
        }
    }
}
