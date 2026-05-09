using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tmp_book_bundle",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    short_url_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tmp_book_bundle", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_email_verified = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "book",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    original_file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    s3key = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    kepub_s3key = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    file_size = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    tmp_book_bundle_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_book", x => x.id);
                    table.ForeignKey(
                        name: "fk_book_tmp_book_bundle_tmp_book_bundle_id",
                        column: x => x.tmp_book_bundle_id,
                        principalTable: "tmp_book_bundle",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pending_book",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    original_file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_size = table.Column<long>(type: "bigint", nullable: false),
                    s3key = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    kepub_s3key = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    tmp_book_bundle_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_pending_book", x => x.id);
                    table.ForeignKey(
                        name: "fk_pending_book_tmp_book_bundle_tmp_book_bundle_id",
                        column: x => x.tmp_book_bundle_id,
                        principalTable: "tmp_book_bundle",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "api_token",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    token = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_api_token", x => x.id);
                    table.ForeignKey(
                        name: "fk_api_token_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "one_time_password",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    code = table.Column<string>(type: "character varying(6)", maxLength: 6, nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_one_time_password", x => x.id);
                    table.ForeignKey(
                        name: "fk_one_time_password_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_api_token_token",
                table: "api_token",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_api_token_user_id",
                table: "api_token",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_book_tmp_book_bundle_id",
                table: "book",
                column: "tmp_book_bundle_id");

            migrationBuilder.CreateIndex(
                name: "ix_one_time_password_code_user_id",
                table: "one_time_password",
                columns: new[] { "code", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_one_time_password_user_id",
                table: "one_time_password",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_pending_book_tmp_book_bundle_id",
                table: "pending_book",
                column: "tmp_book_bundle_id");

            migrationBuilder.CreateIndex(
                name: "ix_tmp_book_bundle_short_url_code",
                table: "tmp_book_bundle",
                column: "short_url_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "api_token");

            migrationBuilder.DropTable(
                name: "book");

            migrationBuilder.DropTable(
                name: "one_time_password");

            migrationBuilder.DropTable(
                name: "pending_book");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "tmp_book_bundle");
        }
    }
}
