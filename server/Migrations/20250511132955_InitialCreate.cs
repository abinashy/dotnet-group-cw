using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookNook.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "2b35b38a-3957-436e-8158-85ca3995c1f7", "AQAAAAIAAYagAAAAEHmXGEjv23HUzl2KHvhjSKek/Zs5MTikuMf9TQIRiAUDkUbF5uqRJEVEWRN2jlVzrw==", "2a949636-630a-4021-a49d-2d88455e8a1f" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 2L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "1344a5bb-b213-4299-855f-c5966fb0c706", "AQAAAAIAAYagAAAAEFBHpm6dGbGXmJVAoDT0B51fB1DtmfbHbxq15h1D+X7G+GNQ8u0P+CIP3YWJwtZnyA==", "dbbf4615-ab32-4c21-aa77-323da6aa3766" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 3L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "a4b76ada-c3d0-4bee-bf42-c455f05ca3c5", "AQAAAAIAAYagAAAAECFF+gU2ZUOjiPyiixTmda9XzHO9ISHXebhlwGsCMQqHAqXCiDRJiEiOrgdJruog+Q==", "7fd94802-70e6-481a-abfb-c40a00bed3d8" });

            migrationBuilder.UpdateData(
                table: "Authors",
                keyColumn: "AuthorId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 5, 11, 13, 29, 54, 627, DateTimeKind.Utc).AddTicks(7471));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "38551411-b730-4b77-9f41-da6b9f34c26c", "AQAAAAIAAYagAAAAEBnoMu5uiVBqGJGh+JInsbyjmh22BAQ13RYfer/g5zjZ+mkzE6yeqVKRfmYDXo20KQ==", "5b847393-b02b-46c1-ba22-378f801adb36" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 2L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "926fae9b-3c7c-41c5-8f50-0d419ce43303", "AQAAAAIAAYagAAAAEHSGryz/Pa1SPkgVVsUSnQv0nwLVDcs1gYj3V3FPHqUlu2sUwYyksOABuETsEofjhg==", "f62108ec-caa6-4cb5-a15e-6be434aa70f5" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 3L,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "0c976414-f97a-4130-ab95-23e830d328dd", "AQAAAAIAAYagAAAAECjNiPFc9Fqp860hBtwaqDlnHgPc/8XpwjllopNT138dA5VKnCQUR2r4FikOLQpxGQ==", "64941634-fde8-4ddb-8ce0-07fd93a9ef62" });

            migrationBuilder.UpdateData(
                table: "Authors",
                keyColumn: "AuthorId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 5, 11, 13, 25, 8, 362, DateTimeKind.Utc).AddTicks(3593));
        }
    }
}
