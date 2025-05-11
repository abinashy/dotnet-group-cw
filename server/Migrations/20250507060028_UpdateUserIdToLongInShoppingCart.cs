using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookNook.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserIdToLongInShoppingCart : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE \"ShoppingCarts\" ALTER COLUMN \"UserId\" TYPE bigint USING \"UserId\"::bigint;");

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

            migrationBuilder.CreateIndex(
                name: "IX_ShoppingCarts_UserId",
                table: "ShoppingCarts",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ShoppingCarts_AspNetUsers_UserId",
                table: "ShoppingCarts",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShoppingCarts_AspNetUsers_UserId",
                table: "ShoppingCarts");

            migrationBuilder.DropIndex(
                name: "IX_ShoppingCarts_UserId",
                table: "ShoppingCarts");

            migrationBuilder.Sql("ALTER TABLE \"ShoppingCarts\" ALTER COLUMN \"UserId\" TYPE text;");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "bf8f4c3a-6354-4fc6-8ded-9dcb3c65a334", "AQAAAAIAAYagAAAAEPeI5afzavW/zknQbjAbbcpiYZqya1u/2M0mOYq1GjudyHiTL76RmWK94cLJMu90Xg==", "b530b4fc-f098-4329-828e-038de11b36e5" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 2L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "5573f197-7558-4595-9666-f997b11b54d7", "AQAAAAIAAYagAAAAEAowum0i0qZ3gX/7G+8uJdH5ixiTe9Pff24Wba9ZlOkOxByu21Se/4VR7hH9u9nGXg==", "74861e88-f3a9-410a-a7e6-215b9945ffc1" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 3L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "954a986f-a827-4e94-b243-ae85ed3fe321", "AQAAAAIAAYagAAAAENSqRH2x5radEfec6I6ovAwD0QTjUqP2eaSJWRuoEy3I/9CAGFfFuLbJPxV6c02x8g==", "66c1b6e7-b058-4534-8a1f-ccdb169e177e" });

            migrationBuilder.UpdateData(
                table: "Authors",
                keyColumn: "AuthorId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 5, 6, 11, 57, 47, 953, DateTimeKind.Utc).AddTicks(8619));
        }
    }
}
