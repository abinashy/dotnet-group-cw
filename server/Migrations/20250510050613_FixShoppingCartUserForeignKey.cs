using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookNook.Migrations
{
    /// <inheritdoc />
    public partial class FixShoppingCartUserForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "9fc9109b-ca82-45ef-877d-d3e73b044a18", "AQAAAAIAAYagAAAAEGGXlRrKcgXs8aE2dBd86x9bGQlj+u/nNkp7Z4brXpV2HEWo+j05ARt2cZuH+kSURQ==", "bdff069f-157b-4304-a043-75685af57ebf" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 2L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "4454bb3a-7ff8-44c4-b1aa-a0c33c23e416", "AQAAAAIAAYagAAAAEOVNwivzg1P8FU3T5vPN9wtZHR+qrkg8c4ex3WVbixPcp4MOB5l6xY+1jJiDgbmw9A==", "26e31922-bc91-4b96-8bba-ee687e957c1b" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 3L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "3778a0de-4a3a-4376-8c91-3ca5eddd21d6", "AQAAAAIAAYagAAAAEObQauw3NIaQQ13d2mec+P+KsodINMlPr3c+W1vukjz6qN/5oSoYc89vN3YOVTT8CA==", "757a3000-e721-4bdc-be24-bc263dab536c" });

            migrationBuilder.UpdateData(
                table: "Authors",
                keyColumn: "AuthorId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 5, 10, 5, 6, 12, 869, DateTimeKind.Utc).AddTicks(5400));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "6687e832-eb48-42f6-8e95-2756218cd6bf", "AQAAAAIAAYagAAAAEGwNLi/fBtVIABddYnbh6kJuI+vn7I+Ibvxgt5VM7pXFcveu2kx63zC+zabjsmEQ4w==", "17038f7e-3327-45f4-b700-35746fe8f855" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 2L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "625f894b-8c63-49ad-8db8-822c897fb5eb", "AQAAAAIAAYagAAAAEMx1IKYKf30gQ+WHUdP3pOKxjmm2yT/Pj/o0WBsACr9402jYT2BSNXdGWxMt6oMQSg==", "e2021b4a-cf87-4e66-8742-0cc3fb155e39" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 3L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "1189a641-2737-4624-8fa7-fca9f1e8ef9e", "AQAAAAIAAYagAAAAEJY4WV3nXQ7TzPHIHjPAabBxelNR3GsQ8hTcnMEw4cAoTRdDejpjQQo4HcuXonvfjA==", "2842978c-f120-4cac-9338-5b3d03cae64d" });

            migrationBuilder.UpdateData(
                table: "Authors",
                keyColumn: "AuthorId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 5, 7, 6, 0, 27, 767, DateTimeKind.Utc).AddTicks(2910));
        }
    }
}
