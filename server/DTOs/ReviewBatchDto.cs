namespace BookNook.DTOs
{
    public class ReviewBatchDto
    {
        public int OrderId { get; set; }
        public List<ReviewDto> Reviews { get; set; }
    }

    public class ReviewDto
    {
        public int BookId { get; set; }
        public int OrderId { get; set; }
        public int Rating { get; set; }
        public string Review { get; set; }
    }
} 