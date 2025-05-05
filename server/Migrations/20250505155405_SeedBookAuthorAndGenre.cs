using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BookNook.Migrations
{
    /// <inheritdoc />
    public partial class SeedBookAuthorAndGenre : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "072b4408-e035-46f3-aafb-f658a77e43df", "AQAAAAIAAYagAAAAEGji5aHfPCOfWkCfaBmD6q+HhZAxFaFMLz4EF3kig7JvEQdMEXFK900rP/irBX8IbQ==", "7074e131-006d-4f10-b503-8466921b7f5c" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 2L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "4387a7f7-a334-45ff-932d-a82ecb23884d", "AQAAAAIAAYagAAAAENyjCVwSvK/pv4Mr3V6hRNjeg6vguEbuLFrVjzsZXdBCesP4DMWCWSu2Eodtd1qVwA==", "a9a79083-7fd1-4c36-bb60-288c80ce0e01" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 3L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "167bd006-11be-4f87-8cd6-cdb0afe43f9b", "AQAAAAIAAYagAAAAEKl4SDDXtakF77+sV/Tp04X7YKh6QkSmwotljBCoC/qX3H0AKDHJjwueLB7LwMIgiQ==", "1646c4f9-09ee-40c7-a2fb-ef3532b2b777" });

            migrationBuilder.UpdateData(
                table: "Authors",
                keyColumn: "AuthorId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 5, 5, 15, 54, 4, 369, DateTimeKind.Utc).AddTicks(2723));

            migrationBuilder.InsertData(
                table: "BookAuthors",
                columns: new[] { "BookAuthorId", "AuthorId", "BookId" },
                values: new object[,]
                {
                    { 1, 1, 1 },
                    { 2, 1, 2 },
                    { 3, 1, 3 }
                });

            migrationBuilder.InsertData(
                table: "BookGenres",
                columns: new[] { "BookGenreId", "BookId", "GenreId" },
                values: new object[,]
                {
                    { 1, 1, 1 },
                    { 2, 2, 1 },
                    { 3, 3, 1 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "BookAuthors",
                keyColumn: "BookAuthorId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "BookAuthors",
                keyColumn: "BookAuthorId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "BookAuthors",
                keyColumn: "BookAuthorId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "BookGenres",
                keyColumn: "BookGenreId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "BookGenres",
                keyColumn: "BookGenreId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "BookGenres",
                keyColumn: "BookGenreId",
                keyValue: 3);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "35a3d5ca-f9e2-4407-a5ef-9cf7fa6f8100", "AQAAAAIAAYagAAAAEJ7Xmcrv7+YsXwgUV/WyEyJqL6WylmW6LnZTo8lykT9y+BhShk9LnMAvF6l4/RZsGQ==", "65805bcf-da98-47cf-9c6c-3da9d1e74d58" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 2L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "59d6717c-8314-4854-80dd-044a32fd4702", "AQAAAAIAAYagAAAAEEo2geWG7G9udjkewIo3FuIB3FR8ZKij603EpnNfV0lmNR9n9SHdsiULwN1MQINyzg==", "a4c01779-0826-4c12-803d-f5028ace28b7" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 3L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "7fcba702-b3aa-4d22-af6a-25b4526c0bb4", "AQAAAAIAAYagAAAAEJ1RLsC2aGMbf/p+uGDq+9WaaucUnBBZPcDiL53YDBe0iBU8ZewYqQTOvtUPLms4MA==", "006d9cf6-6dab-496f-9531-42a05ddd7725" });

            migrationBuilder.UpdateData(
                table: "Authors",
                keyColumn: "AuthorId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 5, 5, 15, 40, 20, 500, DateTimeKind.Utc).AddTicks(9754));
        }
    }
}
